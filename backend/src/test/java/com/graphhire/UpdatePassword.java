package com.graphhire;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class UpdatePassword {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/graphhire";
        String user = "postgres";
        String password = "postgres";
        String correctHash = "$2a$10$w5zZsRUx.D7UTyoDrsXaxuTSShu5y7uFU8cNtD/sb3qzJ1OfPRzvC";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {

            // Update admin
            int updated = stmt.executeUpdate(
                "UPDATE sys_user SET password = '" + correctHash + "' WHERE username = 'admin@graphhire.com'"
            );
            System.out.println("Updated admin: " + updated);

            // Update all other users with old hash
            updated = stmt.executeUpdate(
                "UPDATE sys_user SET password = '" + correctHash + "' WHERE password LIKE '$2a$10$N.zmdr9k7uOCQb376NoUnu%'"
            );
            System.out.println("Updated other users: " + updated);

            System.out.println("Done!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
