package com.React.Backend.Service.Impl;




import com.React.Backend.Dao.RoleRepository;
import com.React.Backend.Entity.Role;
import com.React.Backend.Service.RoleService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
@Service
public class RoleServiceImpl implements RoleService {

    private RoleRepository roleRepository;

    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }



    @Override
    public Role getRole() {
        return roleRepository.findByRoleName("User");
    }
}

