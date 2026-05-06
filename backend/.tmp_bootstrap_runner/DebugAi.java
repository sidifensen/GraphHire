package tmp;

import com.graphhire.match.infrastructure.ai.DeepSeekClient;
import java.util.Map;

public class DebugAi {
  public static void main(String[] args) throws Exception {
    DeepSeekClient client = new DeepSeekClient();
    var cls = client.getClass();
    set(cls, client, "enabled", true);
    String apiKey = System.getenv("DEEPSEEK_API_KEY");
    if (apiKey == null) apiKey = "";
    set(cls, client, "apiKey", apiKey);
    String url = System.getenv("DEEPSEEK_URL");
    if (url == null || url.isBlank()) url = "https://api.deepseek.com/v1";
    set(cls, client, "baseUrl", url);
    set(cls, client, "timeoutMs", 30000);
    set(cls, client, "maxRetryAttempts", 1);
    set(cls, client, "retryBackoffMs", 200L);

    Map<String, Object> r = client.generateIndustryProfile("???/???/??/??", "?????");
    System.out.println(r);
  }

  static void set(Class<?> cls, Object o, String f, Object v) throws Exception {
    var fd = cls.getDeclaredField(f);
    fd.setAccessible(true);
    fd.set(o, v);
  }
}
