export class UserDto {
  constructor(apiData) {
    this.id = apiData.id || apiData.user?.id;
    this.username = apiData.username || apiData.user?.username;
    this.email = apiData.email;
    this.role = apiData.role || apiData.rol || 'user';
    this.nickname = apiData.nickname || apiData.username;
  }
  
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      nickname: this.nickname
    };
  }
}
