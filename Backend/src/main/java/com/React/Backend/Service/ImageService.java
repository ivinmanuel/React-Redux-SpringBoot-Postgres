package com.React.Backend.Service;
import com.React.Backend.Dao.ImageRepository;
import com.React.Backend.Entity.Image;
import com.React.Backend.Utils.ImageUtils;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.exception.ContextedRuntimeException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.security.Principal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Optional;
import java.util.zip.DataFormatException;

@Service

@RequiredArgsConstructor
public class ImageService {

    @Value("${upload.folder}")
    private String uploadFolder;
    private final ImageRepository imageRepository;

    public String uploadImage(MultipartFile imageFile, String username) throws IOException {

        // Create upload folder if it doesn't exist
        File folder = new File(uploadFolder);
        if (!folder.exists()) {
            folder.mkdirs();
        }

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        String timeStamp = dateFormat.format(new Date());
        String originalFileName = imageFile.getOriginalFilename();
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String newFileName = "image_" + timeStamp + fileExtension;

        // Save the image file to the upload folder with the new filename
        String filePath = uploadFolder + File.separator + newFileName;
        imageFile.transferTo(new File(filePath));

        // Save the file path to the database
        Image image = new Image();
        image.setFileName(newFileName);
        image.setFilePath(filePath);
        ImageUtils.compressImage(image.getImageData());
        imageRepository.save(image);

        return "File uploaded successfully: " + newFileName;
    }

    public byte[] downloadImage(String imageName,String name) {
        imageRepository.deleteAllByUsername(name);
        Optional<Image> dbImage = imageRepository.findByName(imageName);
        return dbImage.map(image -> {
            try {
                return ImageUtils.decompressImage(image.getImageData());
            } catch (DataFormatException | IOException exception) {
                throw new ContextedRuntimeException("Error downloading an image", exception)
                        .addContextValue("Image ID",  image.getId())
                        .addContextValue("Image name", imageName);
            }
        }).orElse(null);
    }

    public String getfilenameByusename(String name) {
       return   imageRepository.findnamebyusername(name);
    }
}