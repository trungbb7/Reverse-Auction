package vn.edu.hcmuaf.reverseauction.exception;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.http.HttpStatus;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
public class CustomException extends RuntimeException {
    private HttpStatus statusCode;
    private String error;
    private String message;
}
