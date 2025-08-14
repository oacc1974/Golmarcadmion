import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Update last login timestamp
    await this.usersService.updateLastLogin(user._id);
    
    // Remove password from returned user object
    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const payload = { 
      sub: user._id, 
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        store_ids: user.store_ids
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}
