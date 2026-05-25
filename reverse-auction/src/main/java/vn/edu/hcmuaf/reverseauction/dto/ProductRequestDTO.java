package vn.edu.hcmuaf.reverseauction.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequestDTO {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    @Size(max = 1000, message = "Đường dẫn ảnh không được vượt quá 1000 ký tự")
    private String imageUrl;

    @Size(max = 100, message = "Thương hiệu không được vượt quá 100 ký tự")
    private String brand;

    @Size(max = 2000, message = "Mô tả không được vượt quá 2000 ký tự")
    private String description;

    @NotNull(message = "Số lượng tồn kho không được để trống")
    @Min(value = 0, message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")
    private Integer stock;

    @Min(value = 0, message = "Đánh giá phải từ 0 đến 5")
    @Max(value = 5, message = "Đánh giá phải từ 0 đến 5")
    private Byte rating;

    @NotNull(message = "Giá bán không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá bán phải lớn hơn 0")
    private BigDecimal price;
}
