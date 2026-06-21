package vn.edu.hcmuaf.reverseauction.mapper;

import org.springframework.stereotype.Component;
import vn.edu.hcmuaf.reverseauction.dto.FileInfo;
import vn.edu.hcmuaf.reverseauction.entity.FileMgmt;

@Component
public class FileMgmtMapper {
    public FileMgmt toFileMgmt(FileInfo fileInfo) {
        FileMgmt fileMgmt = new FileMgmt();
        fileMgmt.setContentType(fileInfo.getContentType());
        fileMgmt.setSize(fileInfo.getSize());
        fileMgmt.setMd5Checksum(fileInfo.getMd5Checksum());
        fileMgmt.setPath(fileInfo.getPath());
        return fileMgmt;
    }
}
