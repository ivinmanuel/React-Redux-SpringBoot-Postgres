package com.React.Backend.Dao;
import com.React.Backend.Entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    Optional<Image> findByName(String name);
    void  deleteAllByUsername(String username);
    @Query("SELECT i.name FROM Image i WHERE i.username = :name")
    String findnamebyusername(@Param("name") String name);

}