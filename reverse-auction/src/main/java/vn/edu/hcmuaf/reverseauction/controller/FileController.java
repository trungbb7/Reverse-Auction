package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.hcmuaf.reverseauction.dto.response.FileData;
import vn.edu.hcmuaf.reverseauction.dto.response.FileResponse;
import vn.edu.hcmuaf.reverseauction.service.impl.FileService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;

    @PostMapping
    public ResponseEntity<FileResponse> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(fileService.uploadFile(file));
    }

    @PostMapping("/multiple")
    public ResponseEntity<List<FileResponse>> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        return ResponseEntity.ok(fileService.uploadMultipleFiles(files));
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<?> downloadFile(@PathVariable String fileName) throws IOException {
        FileData fileData = fileService.download(fileName);
        MediaType mediaType = MediaType.parseMediaType(fileData.contentType());

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(fileName).build().toString())
                .body(fileData.resource());
    }
}
