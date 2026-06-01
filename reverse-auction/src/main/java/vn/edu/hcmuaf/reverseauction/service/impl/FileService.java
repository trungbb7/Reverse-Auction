package vn.edu.hcmuaf.reverseauction.service.impl;


import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.hcmuaf.reverseauction.dto.response.FileData;
import vn.edu.hcmuaf.reverseauction.dto.response.FileResponse;
import vn.edu.hcmuaf.reverseauction.exception.CustomException;
import vn.edu.hcmuaf.reverseauction.mapper.FileMgmtMapper;
import vn.edu.hcmuaf.reverseauction.repository.FileMgmtRepository;
import vn.edu.hcmuaf.reverseauction.repository.FileRepository;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileService {
    FileRepository fileRepository;
    FileMgmtRepository fileMgmtRepository;

    FileMgmtMapper fileMgmtMapper;

    public FileResponse uploadFile(MultipartFile file) throws IOException {
        var fileInfo = fileRepository.store(file);

        var fileMgmt = fileMgmtMapper.toFileMgmt(fileInfo);
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            fileMgmt.setOwnerId(authentication.getName());
        }

        fileMgmt = fileMgmtRepository.save(fileMgmt);

        return FileResponse.builder()
                .originalFileName(file.getOriginalFilename())
                .url(fileInfo.getUrl())
                .build();
    }

    public List<FileResponse> uploadMultipleFiles(MultipartFile[] files) {
        return Arrays.stream(files).map(file -> {
            try{
                return uploadFile(file);
            }catch (IOException e){
                throw new RuntimeException("Error uploading file" + file.getOriginalFilename(), e);
            }
        }).toList();
    }

    public FileData download(String fileName) throws IOException {
        var resource = fileRepository.read(fileName);
        if (resource == null) {
            throw CustomException.builder()
                    .statusCode(HttpStatus.BAD_REQUEST)
                    .error("error")
                    .message("File Not Found")
                    .build();
        }
        return new FileData(fileRepository.resolveContentType(fileName), resource);
    }
}
