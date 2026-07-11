const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const UserDto = require('../dtos/UserDto');

class UserService {
    async getProfile(userId) {
        const user = await userRepository.getProfile(userId);
        if (!user) {
            throw new Error('Usuario no encontrado en el sistema.');
        }
        return UserDto(user);
    }

    async updateProfile(userId, avatar_url, bio, nickname) {
        const updatedUser = await userRepository.updateProfile(userId, avatar_url || 'none', bio || null, nickname || null);
        return UserDto(updatedUser);
    }

    async changePassword(userId, oldPassword, newPassword) {
        if (!oldPassword || !newPassword) {
            throw new Error('Debe suministrar la contraseña actual y la nueva.');
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado.');
        }

        const validPassword = await bcrypt.compare(oldPassword, user.clave_encriptada);
        if (!validPassword) {
            throw new Error('La contraseña actual es incorrecta.');
        }

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        await userRepository.updatePassword(userId, newPasswordHash);
    }

    async changeDeathCloudId(userId, password, newDeathCloudId) {
        if (!password || !newDeathCloudId) {
            throw new Error('Debe suministrar la contraseña actual y el nuevo DeathCloud ID.');
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado.');
        }

        const validPassword = await bcrypt.compare(password, user.clave_encriptada);
        if (!validPassword) {
            throw new Error('La contraseña ingresada es incorrecta.');
        }

        const exists = await userRepository.checkUsernameExists(newDeathCloudId, userId);
        if (exists) {
            throw new Error('El DeathCloud ID ya está en uso.');
        }

        await userRepository.updateUsername(userId, newDeathCloudId);
        return newDeathCloudId;
    }

    async getPublicProfile(username) {
        const user = await userRepository.getPublicProfile(username);
        if (!user) {
            throw new Error('Usuario no encontrado en el sistema.');
        }
        return UserDto(user);
    }

    async getGlobalCredits(userId) {
        return await userRepository.getGlobalCredits(userId);
    }

    async addGlobalCredits(userId, amount) {
        if (!amount || amount <= 0) {
            throw new Error('Cantidad no válida');
        }
        return await userRepository.addGlobalCredits(userId, amount);
    }

    async getGlobalInventory(userId) {
        return await userRepository.getGlobalInventory(userId);
    }
}

module.exports = new UserService();
