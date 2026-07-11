const friendRepository = require('../repositories/friend.repository');

class FriendService {
    async sendFriendRequest(userId, friendUsername) {
        const destUser = await friendRepository.findUserByUsernameOrNickname(friendUsername);
        if (!destUser) {
            throw new Error(`El usuario '${friendUsername}' no existe.`);
        }

        const friendId = destUser.id;
        const actualFriendUsername = destUser.nombre_usuario;

        if (friendId === userId) {
            throw new Error("No puedes enviarte una solicitud de amistad a ti mismo.");
        }

        const existing = await friendRepository.checkExistingRequest(userId, friendId);
        if (existing) {
            if (existing.estado === 'aceptado') {
                throw new Error("Ya eres amigo de este usuario.");
            } else if (existing.usuario_id_envia === userId) {
                throw new Error("Ya has enviado una solicitud de amistad pendiente a este usuario.");
            } else {
                throw new Error("Este usuario ya te ha enviado una solicitud de amistad. Por favor, revísala.");
            }
        }

        const request = await friendRepository.createFriendRequest(userId, friendId);
        return { request, actualFriendUsername };
    }

    async getFriendsAndRequests(userId) {
        const friends = await friendRepository.getAcceptedFriends(userId);
        const incoming = await friendRepository.getIncomingRequests(userId);
        const outgoing = await friendRepository.getOutgoingRequests(userId);

        return {
            friends,
            requests: {
                incoming,
                outgoing
            }
        };
    }

    async respondFriendRequest(userId, requestId, action) {
        if (action === 'aceptado') {
            const success = await friendRepository.acceptRequest(requestId, userId);
            if (!success) {
                throw new Error("Solicitud no encontrada o no tienes permisos para aceptarla.");
            }
            return "Solicitud de amistad aceptada correctamente.";
        } else {
            const success = await friendRepository.deleteRequestOrFriend(requestId, userId);
            if (!success) {
                throw new Error("Solicitud no encontrada.");
            }
            return "Solicitud de amistad rechazada/cancelada.";
        }
    }

    async removeFriend(userId, friendIdParam) {
        const success = await friendRepository.deleteRequestOrFriend(friendIdParam, userId);
        if (!success) {
            throw new Error("Amigo no encontrado o no tienes permisos.");
        }
        return "Amistad finalizada de forma segura.";
    }
}

module.exports = new FriendService();
