function UserDto(user) {
    return {
        id: user.id,
        username: user.nombre_usuario,
        nickname: user.nickname,
        email: user.email,
        role: user.rol,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        createdAt: user.fecha_creacion
    };
}

module.exports = UserDto;
