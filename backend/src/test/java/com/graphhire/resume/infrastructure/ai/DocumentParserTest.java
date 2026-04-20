package com.graphhire.resume.infrastructure.ai;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DocumentParserTest {

    @Test
    void shouldDelegateToDocumentTextExtractor() {
        DocumentTextExtractor extractor = mock(DocumentTextExtractor.class);
        when(extractor.extractText("/tmp/resume.pdf")).thenReturn("提取文本");
        DocumentParser parser = new DocumentParser(extractor);

        String result = parser.extractText("/tmp/resume.pdf");

        assertEquals("提取文本", result);
        verify(extractor).extractText("/tmp/resume.pdf");
    }
}
