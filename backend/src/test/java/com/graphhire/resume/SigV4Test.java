package com.graphhire.resume;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class SigV4Test {
    public static void main(String[] args) throws Exception {
        String secretKey = "rustfsadmin";
        String dateStamp = "20260420";
        String region = "us-east-1";
        String service = "s3";
        String amzDate = "20260420T120000Z";
        String method = "GET";
        String canonicalUri = "/resumes/1745142911122_test.pdf";
        String canonicalQuerystring = "";
        String host = "localhost:9000";
        String payloadHash = "UNSIGNED-PAYLOAD";
        
        // Compute signing key
        byte[] kDate = hmacSha256(("AWS4" + secretKey).getBytes(StandardCharsets.UTF_8), dateStamp);
        System.out.println("kDate: " + bytesToHex(kDate));
        byte[] kRegion = hmacSha256(kDate, region);
        byte[] kService = hmacSha256(kRegion, service);
        byte[] kSigning = hmacSha256(kService, "aws4_request");
        System.out.println("kSigning: " + bytesToHex(kSigning));
        
        // Canonical request
        String canonicalHeaders = "host:" + host + "\n" +
            "x-amz-content-sha256:" + payloadHash + "\n" +
            "x-amz-date:" + amzDate + "\n";
        String signedHeaders = "host;x-amz-content-sha256;x-amz-date";
        
        String canonicalRequest = method + "\n" +
            canonicalUri + "\n" +
            canonicalQuerystring + "\n" +
            canonicalHeaders + "\n" +
            signedHeaders + "\n" +
            payloadHash;
        
        System.out.println("=== Canonical Request ===");
        System.out.println(canonicalRequest);
        System.out.println("hash: " + sha256Hex(canonicalRequest));
        
        // String to sign
        String credentialScope = dateStamp + "/" + region + "/" + service + "/aws4_request";
        String hashedCanonicalRequest = sha256Hex(canonicalRequest);
        String stringToSign = "AWS4-HMAC-SHA256\n" +
            amzDate + "\n" +
            credentialScope + "\n" +
            hashedCanonicalRequest;
        
        System.out.println("\n=== String to Sign ===");
        System.out.println(stringToSign);
        
        // Signature
        String signature = bytesToHex(hmacSha256(kSigning, stringToSign));
        System.out.println("\n=== Signature ===");
        System.out.println(signature);
        
        String accessKey = "rustfsadmin";
        String authHeader = "AWS4-HMAC-SHA256 Credential=" + accessKey + "/" + credentialScope + 
            ", SignedHeaders=" + signedHeaders + ", Signature=" + signature;
        System.out.println("\n=== Auth Header ===");
        System.out.println(authHeader);
    }
    
    static byte[] hmacSha256(byte[] key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key, "HmacSHA256");
        mac.init(secretKeySpec);
        return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
    }
    
    static byte[] hmacSha256(byte[] key, String data, boolean unused) throws Exception {
        return hmacSha256(key, data);
    }
    
    static String sha256Hex(String data) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        return bytesToHex(digest.digest(data.getBytes(StandardCharsets.UTF_8)));
    }
    
    static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
