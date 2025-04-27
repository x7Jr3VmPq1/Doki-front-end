// stores/websocketStore.ts
import {defineStore} from 'pinia';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import {useNotificationsStore} from "./notificationsStore.ts";

export const useWebSocketStore = defineStore('websocket', {
    state: () => ({
        stompClient: null as Stomp.Client | null,
        connected: false,
    }),
    actions: {
        connect(userId: string) {
            if (this.connected || this.stompClient) return;

            const socket = new SockJS('http://localhost:8080/ws', null, {
                transports: ['websocket', 'xhr-streaming', 'xhr-polling'], // 不包含 jsonp
            });
            const client = Stomp.over(socket);

            this.stompClient = client;

            client.connect({
                'Authorization': 'Bearer ' + localStorage.getItem('token') // 添加 Authorization 头部
            }, () => {
                this.connected = true;

                client.heartbeat.outgoing = 10000;
                client.heartbeat.incoming = 10000;

                client.subscribe(`/queue/notifications/${userId}`, message => {
                    const body = message.body;
                    const store = useNotificationsStore();
                    if (body === '10000') {
                        store.likeUnreadCount++;
                    } else if (body === '10001') {
                        store.commentUnreadCount++;
                    } else if (body === '20000') {
                        store.messageUnreadCount++;
                    }
                });
            }, error => {
                console.error('WebSocket连接失败:', error);
            });
        },

        send(destination: string, body: any) {
            if (this.connected && this.stompClient) {
                this.stompClient.send(destination, {}, JSON.stringify(body));
            } else {
                console.warn('WebSocket 未连接');
            }
        },
    },
});
