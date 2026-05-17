package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.entity.Product;

import java.util.List;

public interface ProductService {
    List<Product> getProductsBySeller(Long sellerId);
}
