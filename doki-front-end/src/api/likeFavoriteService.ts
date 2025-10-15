import request from './gateway.ts'

export default {
    videoLike: (videoId: number) => request('/like', {
        method: 'GET',
        data: {videoId}
    })
}
