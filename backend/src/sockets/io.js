const ROOMS = {
  lobby: 'community:lobby',
  thread: (courseCode) => `thread:${courseCode}`,
};

export function configureSocket(io) {
  io.on('connection', (socket) => {
    socket.on('join', ({ room }) => {
      if (room) {
        socket.join(room);
      }
    });
  });
}

export function emitNewPost(post) {
  const room = ROOMS.thread(post.courseCode);
  global.io?.to(room).emit('newPost', post);
}

export function emitNewReply(reply) {
  const room = ROOMS.thread(reply.courseCode);
  global.io?.to(room).emit('newReply', reply);
}

export function emitLikeUpdate({ courseCode, commentId, likesCount }) {
  const room = ROOMS.thread(courseCode);
  global.io?.to(room).emit('likeUpdate', { commentId, likesCount });
}

export function emitActivity(activity) {
  global.io?.to(ROOMS.lobby).emit('activity', activity);
}

export function emitTrendingRefresh(trending) {
  if (trending) {
    global.io?.to(ROOMS.lobby).emit('trendingUpdate', trending);
  }
}

export { ROOMS };
