package vn.edu.hcmuaf.reverseauction.exception;



import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.edu.hcmuaf.reverseauction.dto.response.ErrorResponse;
import vn.edu.hcmuaf.reverseauction.service.ReviewService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    public GlobalExceptionHandler(ReviewService reviewService) {
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .error("Forbidden")
                .status(HttpStatus.FORBIDDEN.value())
                .message("Bạn không có quyền thực hiện hành động này")
                .build();
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(BadCredentialsException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .error("Unauthorized")
                .status(HttpStatus.UNAUTHORIZED.value())
                .message("Email or password is not correct!")
                .build();

        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponse> handleDisabledException(DisabledException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .error("Unauthorized")
                .status(HttpStatus.UNAUTHORIZED.value())
                .message("Tài khoản chưa được xác thực email. Vui lòng kiểm tra hộp thư!")
                .build();
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ErrorResponse> handleLockedException(LockedException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .error("Forbidden")
                .status(HttpStatus.FORBIDDEN.value())
                .message("Tài khoản của bạn đã bị khóa hoặc cấm hoạt động!")
                .build();
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<ErrorResponse> handleExpiredJwtException(ExpiredJwtException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .error("Forbidden")
                .status(HttpStatus.FORBIDDEN.value())
                .message("JWT expired!")
                .build();

        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) ->{
            String fieldName = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            fieldErrors.put(fieldName, message);
        });

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .error("Bad Request")
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Invalid values")
                .fieldErrors(fieldErrors)
                .build();
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(SignatureException.class)
    public ResponseEntity<ErrorResponse> handleSignatureException(SignatureException ex) {
        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .error("Unauthorized")
                .status(HttpStatus.UNAUTHORIZED.value())
                .message("Token không hợp lệ!")
                .build();
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(CustomException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .error(ex.getError())
                .status(ex.getStatus().value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(error, ex.getStatus());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .error("Bad request")
                .status(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}