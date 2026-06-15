package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.reverseauction.entity.FileMgmt;

@Repository
public interface FileMgmtRepository extends JpaRepository<FileMgmt, Long> {
}
