package vn.edu.hcmuaf.reverseauction.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import vn.edu.hcmuaf.reverseauction.dto.CategoryDTO;
import vn.edu.hcmuaf.reverseauction.entity.Category;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryMapper INSTANCE = Mappers.getMapper(CategoryMapper.class);

    CategoryDTO toDTO(Category category);
    Category toEntity(CategoryDTO categoryDTO);
    List<CategoryDTO> toDTOList(List<Category> categories);
}
