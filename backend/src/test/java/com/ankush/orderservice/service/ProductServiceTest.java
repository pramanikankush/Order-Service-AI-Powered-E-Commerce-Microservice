package com.ankush.orderservice.service;

import com.ankush.orderservice.ai.EmbeddingService;
import com.ankush.orderservice.dto.ProductRequest;
import com.ankush.orderservice.dto.ProductResponse;
import com.ankush.orderservice.entity.Inventory;
import com.ankush.orderservice.entity.Product;
import com.ankush.orderservice.exception.DuplicateSkuException;
import com.ankush.orderservice.mapper.ProductMapper;
import com.ankush.orderservice.repository.InventoryRepository;
import com.ankush.orderservice.repository.ProductRepository;
import com.ankush.orderservice.repository.VectorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock ProductRepository products;
    @Mock InventoryRepository inventoryRepo;
    @Mock VectorRepository vectorRepo;
    @Mock EmbeddingService embeddingService;
    @Mock ProductMapper mapper;

    @InjectMocks ProductService service;

    @Test
    void create_throws_when_sku_exists() {
        when(products.existsBySku("DUP")).thenReturn(true);
        ProductRequest req = new ProductRequest("DUP", "T", "D", "C", BigDecimal.ONE, null, 1);
        assertThrows(DuplicateSkuException.class, () -> service.create(req));
    }

    @Test
    void create_saves_product_and_inventory() {
        when(products.existsBySku(any())).thenReturn(false);
        Product entity = Product.builder().sku("SKU1").title("T").price(BigDecimal.TEN).build();
        when(mapper.toEntity(any())).thenReturn(entity);
        when(embeddingService.embeddingCsv(any())).thenReturn("0.1,0.2,0.3");
        when(products.save(any())).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(java.util.UUID.randomUUID());
            return p;
        });
        when(inventoryRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ProductRequest req = new ProductRequest("SKU1", "T", "D", "C", BigDecimal.TEN, null, 7);
        ProductResponse resp = new ProductResponse(java.util.UUID.randomUUID(), "SKU1", "T", "D", "C",
                BigDecimal.TEN, null, 7, true, null, null);
        when(mapper.toResponse(any())).thenReturn(resp);

        ProductResponse out = service.create(req);

        verify(products).save(any(Product.class));
        verify(inventoryRepo).save(any(Inventory.class));
        verify(embeddingService).embeddingCsv(any());
        assertNotNull(out);
    }
}
