package vn.edu.hcmuaf.reverseauction.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class FileMgmt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String ownerId;
    String contentType;
    long size;
    String md5Checksum;
    String path;
}
