import java.nio.file.*;
import java.sql.*;
import java.util.*;

public class RunSql {
  public static void main(String[] args) throws Exception {
    String url = "jdbc:postgresql://127.0.0.1:5432/graphhire";
    String user = "postgres";
    String pass = "postgres";
    String sql = Files.readString(Path.of(args[0]));

    try (Connection c = DriverManager.getConnection(url, user, pass)) {
      c.setAutoCommit(true);

      String kill = """
      WITH blocked AS (
        SELECT DISTINCT bl.pid AS blocked_pid, kl.pid AS blocking_pid
        FROM pg_locks bl
        JOIN pg_locks kl
          ON bl.locktype = kl.locktype
         AND bl.database IS NOT DISTINCT FROM kl.database
         AND bl.relation IS NOT DISTINCT FROM kl.relation
         AND bl.page IS NOT DISTINCT FROM kl.page
         AND bl.tuple IS NOT DISTINCT FROM kl.tuple
         AND bl.classid IS NOT DISTINCT FROM kl.classid
         AND bl.objid IS NOT DISTINCT FROM kl.objid
         AND bl.objsubid IS NOT DISTINCT FROM kl.objsubid
         AND bl.virtualxid IS NOT DISTINCT FROM kl.virtualxid
         AND bl.transactionid IS NOT DISTINCT FROM kl.transactionid
         AND bl.pid <> kl.pid
        WHERE NOT bl.granted AND kl.granted
      )
      SELECT pg_terminate_backend(blocking_pid)
      FROM blocked
      WHERE blocking_pid <> pg_backend_pid();
      """;
      try (Statement st = c.createStatement()) { st.execute(kill); }

      List<String> stmts = splitStatements(sql);
      int ok = 0;
      for (String s: stmts) {
        String t = s.trim();
        if (t.isEmpty()) continue;
        try (Statement st = c.createStatement()) {
          st.setQueryTimeout(120);
          st.execute(t);
          ok++;
        } catch (SQLException ex) {
          System.err.println("FAILED SQL: " + preview(t));
          throw ex;
        }
      }
      System.out.println("Executed statements: " + ok);

      try (Statement st = c.createStatement()) {
        try (ResultSet rs = st.executeQuery("SELECT level, COUNT(*) cnt FROM industry WHERE deleted=0 GROUP BY level ORDER BY level")) {
          while(rs.next()) {
            System.out.println("level="+rs.getInt(1)+", cnt="+rs.getInt(2));
          }
        }
      }
    }
  }

  static String preview(String s) {
    s = s.replaceAll("\\s+", " ");
    return s.length() > 240 ? s.substring(0,240)+"..." : s;
  }

  static List<String> splitStatements(String sql) {
    List<String> out = new ArrayList<>();
    StringBuilder cur = new StringBuilder();
    boolean inSingle = false;
    boolean inDouble = false;
    boolean inDollar = false;
    String dollarTag = null;

    for (int i=0;i<sql.length();i++) {
      char ch = sql.charAt(i);
      if (!inSingle && !inDouble) {
        if (!inDollar && ch == '$') {
          int j = i+1;
          while (j < sql.length() && (Character.isLetterOrDigit(sql.charAt(j)) || sql.charAt(j)=='_')) j++;
          if (j < sql.length() && sql.charAt(j) == '$') {
            dollarTag = sql.substring(i, j+1);
            inDollar = true;
            cur.append(dollarTag);
            i = j;
            continue;
          }
        } else if (inDollar && dollarTag != null && sql.startsWith(dollarTag, i)) {
          cur.append(dollarTag);
          i += dollarTag.length()-1;
          inDollar = false;
          dollarTag = null;
          continue;
        }
      }

      if (!inDollar) {
        if (ch == '\'' && !inDouble) inSingle = !inSingle;
        else if (ch == '"' && !inSingle) inDouble = !inDouble;
      }

      if (ch == ';' && !inSingle && !inDouble && !inDollar) {
        out.add(cur.toString());
        cur.setLength(0);
      } else {
        cur.append(ch);
      }
    }
    if (cur.length() > 0) out.add(cur.toString());
    return out;
  }
}