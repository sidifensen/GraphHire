package com.graphhire;

import cn.hutool.crypto.digest.BCrypt;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class BCryptTest {
    @Test
    void testPasswordHash() {
        // Database hash
        String dbHash = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi";
        String password = "password123";

        // Verify the database hash
        boolean dbMatches = BCrypt.checkpw(password, dbHash);
        System.out.println("Database hash matches 'password123': " + dbMatches);

        // Generate correct hash for password123 using Hutool
        String correctHash = BCrypt.hashpw(password, BCrypt.gensalt());
        System.out.println("Correct hash for 'password123': " + correctHash);
        System.out.println("Correct hash verification: " + BCrypt.checkpw(password, correctHash));

        // This test will show us the correct hash
        assertNotNull(correctHash, "Should generate a hash");
    }
}
