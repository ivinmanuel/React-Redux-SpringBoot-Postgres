package com.React.Backend.Entity;



import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter@Setter@AllArgsConstructor@NoArgsConstructor
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long id;

    private String roleName;


    @OneToMany(fetch = FetchType.EAGER,cascade = CascadeType.ALL,mappedBy = "role" )
    private Set<UserRole> userRoles=new HashSet<>();


}
