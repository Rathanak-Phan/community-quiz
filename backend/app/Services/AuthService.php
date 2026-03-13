<?php 
namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService{
    public function register($data){
        /** @var \App\Models\User $user */
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password'])
        ]);
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token
        ];
    }
    public function login($data){
        /** @var \App\Models\User|null $user */
        $user = User::where('email', $data['email'])->first();

        if(!$user || !Hash::check($data['password'], $user->password)){
            return null;
        }
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token
        ];
    }

}
