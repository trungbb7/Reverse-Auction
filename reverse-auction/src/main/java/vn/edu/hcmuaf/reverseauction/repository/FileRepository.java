package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Repository;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.hcmuaf.reverseauction.dto.FileInfo;
import vn.edu.hcmuaf.reverseauction.entity.FileMgmt;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Repository
public class FileRepository {
    @Value("${app.file.storage-dir:uploads}")
    String storageDir;

    @Value("${app.file.download-prefix:http://localhost:8080/api/files/}")
    String urlPrefix;

    public FileInfo store(MultipartFile file) throws IOException {
        Path folder = Paths.get(storageDir);
        Files.createDirectories(folder);

        String fileExtension = StringUtils
                .getFilenameExtension(file.getOriginalFilename());

        String fileName = Objects.isNull(fileExtension)
                ? UUID.randomUUID().toString()
                : UUID.randomUUID() + "." + fileExtension;

        Path filePath = folder.resolve(fileName).normalize().toAbsolutePath();

        byte[] bytes = file.getBytes();
        Files.write(filePath, bytes);

        return FileInfo.builder()
                .name(fileName)
                .size(file.getSize())
                .contentType(file.getContentType())
                .md5Checksum(DigestUtils.md5DigestAsHex(bytes))
                .path(filePath.toString())
                .url(urlPrefix + fileName)
                .build();
    }

    public Resource read(FileMgmt fileMgmt) throws IOException {
        var data = Files.readAllBytes(Path.of(fileMgmt.getPath()));
        return new ByteArrayResource(data);
    }

    public Resource read(String fileName) throws IOException {
        Path filePath = Paths.get(storageDir).resolve(fileName).normalize().toAbsolutePath();
        if (!Files.exists(filePath)) {
            return null;
        }

        var data = Files.readAllBytes(filePath);
        return new ByteArrayResource(data);
    }

    public String resolveContentType(String fileName) throws IOException {
        Path filePath = Paths.get(storageDir).resolve(fileName).normalize().toAbsolutePath();
        String contentType = Files.probeContentType(filePath);
        if (contentType != null) {
            return contentType;
        }

        String lowerName = fileName.toLowerCase();
        if (lowerName.endsWith(".png")) {
            return "image/png";
        }
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        return "application/octet-stream";
    }
}
