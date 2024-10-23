package com.React.Backend.Controller;
import com.React.Backend.Config.JwtUtils;
import com.React.Backend.Config.UserDetailsServiceImpl;
import com.React.Backend.Entity.User;
import com.React.Backend.Model.JwtRequest;
import com.React.Backend.Model.JwtResponse;
import com.React.Backend.Service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;


@RestController
@CrossOrigin("*")
public class AuthenticateController {

    private AuthenticationManager authenticationManager;

    private JwtUtils jwtUtils;

    private UserService userService;

    private UserDetailsServiceImpl userDetailsServiceImpl;

    public AuthenticateController(AuthenticationManager authenticationManager, JwtUtils jwtUtils,
                                  UserDetailsServiceImpl userDetailsServiceImpl,UserService userService) {
        this.userService=userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userDetailsServiceImpl = userDetailsServiceImpl;
    }


    @PostMapping("/generate-token")
    public ResponseEntity<?> generateToken(@RequestBody JwtRequest jwtRequest)throws Exception{



        try {
            System.out.println("call get on JWT filler at login time " +
                    "  with url= generate-request" );
            User user = userService.getUser(jwtRequest.getUsername());
            if(user.isDeleted()){
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Credentials");
            }
            this.authenticate(jwtRequest.getUsername(), jwtRequest.getPassword());

            UserDetails userDetails = this.userDetailsServiceImpl.loadUserByUsername(jwtRequest.getUsername());
            String token = this.jwtUtils.generateToken(userDetails);

            JwtResponse jwtResponse = new JwtResponse(token,user);
            System.out.println("sout before sent response sent with new jwt token");
            return ResponseEntity.ok(jwtResponse);


        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User Not Found");
        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User Disabled");
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Credentials");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error");
        }

    }

    private void authenticate(String userName,String password){

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(userName, password));

    }






            @GetMapping("/logout")
        public void logout(){
            SecurityContextHolder.clearContext();

        }

}
