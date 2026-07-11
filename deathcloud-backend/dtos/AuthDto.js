function AuthResponseDto(user, token) {
    return {
        id: user.id,
        username: user.nombre_usuario,
        nickname: user.nickname || user.nombre_usuario,
        role: user.rol,
        token: token
    };
}

module.exports = AuthResponseDto;
