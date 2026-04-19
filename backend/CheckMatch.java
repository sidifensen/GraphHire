import java.sql.*;

public class CheckMatch {
    public static void main(String[] args) throws Exception {
        Class.forName("org.postgresql.Driver");
        try (Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/graphhire", "postgres", "postgres")) {
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT id, match_detail FROM match_record LIMIT 5");
            while (rs.next()) {
                System.out.println("ID: " + rs.getInt("id") + ", match_detail: " + rs.getString("match_detail"));
            }
        }
    }
}