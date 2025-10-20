<?php

namespace App\Http\Controllers;

use App\Http\Requests\AuthRequest;
use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;


class AuthController extends Controller
{

    //* creates an object representing AuthService.php constructor to help on using the available methods in this class
    public function __construct(private AuthService $authService){}

    public function register(AuthRequest $request){
        //* uses the function from the authService to register the user
        $registeredUser = $this -> authService -> register($request -> validated());
        //* Issues a token for automatic log in 
        $token = $registeredUser -> createToken('api-token') -> plainTextToken;


        //* returns the registered user
        return response() -> json(["user" => $registeredUser, "token" => $token]);
        
        
    }
    public function login(LoginRequest $request){
        $loggedInUser = $this -> authService -> login($request -> validated());

        if(!$loggedInUser){
            return response() -> json(["message" => "Account not found"],404);
        }

        //generates a token when a user is logged in
        //!Please note that the red error here is just okay
        $token = $loggedInUser -> createToken('api-token') -> plainTextToken;

        return response() -> json(["account" =>  $loggedInUser, "token" => $token,"message" ],200);
    
    }

    public function logout(Request $request){
        $this -> authService -> logout($request);

        return response() -> json(["message" => "User Logged Out"]);

    }


}
