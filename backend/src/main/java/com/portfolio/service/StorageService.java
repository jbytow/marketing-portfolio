package com.portfolio.service;

import com.portfolio.entity.MediaType;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${app.upload.path}")
    private String uploadPath;

    @Value("${app.upload.allowed-types}")
    private String allowedTypes;

    private static final Set<String> MEDIA_SUBDIRECTORIES = Set.of("images", "videos", "documents");

    private Path rootLocation;
    private Set<String> allowedMimeTypes;

    @PostConstruct
    public void init() {
        rootLocation = Paths.get(uploadPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }

        allowedMimeTypes = Set.of(allowedTypes.split(","));
    }

    public String store(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedMimeTypes.contains(contentType)) {
            throw new IllegalArgumentException("File type not allowed: " + contentType);
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = getExtension(originalFilename);
        String filename = UUID.randomUUID().toString() + extension;

        // Create subdirectory based on media type
        String subDir = getSubDirectory(contentType);
        Path destinationDir = rootLocation.resolve(subDir);
        Files.createDirectories(destinationDir);

        Path destinationFile = destinationDir.resolve(filename);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
        }

        return subDir + "/" + filename;
    }

    public Resource loadAsResource(String filename) {
        Path file = resolveInsideRoot(filename);
        if (!Files.isRegularFile(file) || !Files.isReadable(file)) {
            throw new EntityNotFoundException("Media file not found: " + filename);
        }
        return new FileSystemResource(file);
    }

    public void delete(String filename) throws IOException {
        Files.deleteIfExists(resolveInsideRoot(filename));
    }

    public static boolean isMediaSubdirectory(String subDir) {
        return MEDIA_SUBDIRECTORIES.contains(subDir);
    }

    // Names come from URLs and the DB; normalizing and checking the prefix keeps them inside the
    // upload root even if the HTTP firewall that rejects ".." is ever relaxed.
    private Path resolveInsideRoot(String filename) {
        Path file = rootLocation.resolve(filename).normalize();
        if (!file.startsWith(rootLocation)) {
            throw new EntityNotFoundException("Media file not found: " + filename);
        }
        return file;
    }

    public MediaType getMediaType(String mimeType) {
        if (mimeType.startsWith("image/")) {
            return MediaType.IMAGE;
        } else if (mimeType.startsWith("video/")) {
            return MediaType.VIDEO;
        } else if (mimeType.equals("application/pdf")) {
            return MediaType.PDF;
        }
        return MediaType.IMAGE;
    }

    private String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex > 0 ? filename.substring(dotIndex) : "";
    }

    private String getSubDirectory(String mimeType) {
        if (mimeType.startsWith("image/")) {
            return "images";
        } else if (mimeType.startsWith("video/")) {
            return "videos";
        } else if (mimeType.equals("application/pdf")) {
            return "documents";
        }
        return "other";
    }
}
