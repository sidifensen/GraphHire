package com.graphhire.resume.infrastructure.ai;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Component
public class TikaTextExtractor {

    private final Tika tika = new Tika();

    public String extract(byte[] bytes, String filePath) {
        try {
            return tika.parseToString(new ByteArrayInputStream(bytes));
        } catch (IOException | TikaException e) {
            throw new RuntimeException("Failed to extract text from document: " + filePath, e);
        }
    }
}
