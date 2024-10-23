package com.React.Backend.Controller;

import com.React.Backend.Service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;

import static org.springframework.http.MediaType.IMAGE_PNG_VALUE;

@RestController
@CrossOrigin("*")
@RequestMapping("/api")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @PostMapping("/addimg")
    public ResponseEntity<?> uploadImage(@RequestBody MultipartFile image, Principal principal) throws IOException {

        String username=principal.getName();
        String uploadImage = imageService.uploadImage(image,username);
        return ResponseEntity.status(HttpStatus.OK).body(uploadImage);
    }

    @GetMapping("/getImage")
    public ResponseEntity<?> downloadImage(Principal principal) {
        try {
            String username = principal.getName();
            String fileName = imageService.getfilenameByusename(username);
            byte[] imageData = imageService.downloadImage(fileName, username);

            if (imageData == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Image not found");
            }

            // Detect image type by file extension (optional improvement)
            String fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
            MediaType mediaType = MediaType.IMAGE_JPEG; // Default

            if ("png".equals(fileExtension)) {
                mediaType = MediaType.IMAGE_PNG;
            } else if ("jpg".equals(fileExtension) || "jpeg".equals(fileExtension)) {
                mediaType = MediaType.IMAGE_JPEG;
            }

            return ResponseEntity.status(HttpStatus.OK)
                    .contentType(mediaType)
                    .body(imageData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving image");
        }
    }
}
