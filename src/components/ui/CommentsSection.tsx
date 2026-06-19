import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { eventApi, Comment } from '../../api/event';

interface CommentsSectionProps {
  eventId: string;
  comments: Comment[];
  onCommentsChanged: () => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  eventId,
  comments,
  onCommentsChanged
}) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await eventApi.addComment(eventId, { content: newComment.trim() });
      setNewComment('');
      onCommentsChanged();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('❌ Ошибка при добавлении комментария');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await eventApi.updateComment(commentId, editContent.trim());
      setEditingCommentId(null);
      setEditContent('');
      onCommentsChanged();
    } catch (error) {
      console.error('Failed to update comment:', error);
      alert('❌ Ошибка при редактировании комментария');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await eventApi.deleteComment(commentId);
      onCommentsChanged();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('❌ Ошибка при удалении комментария');
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

    return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#8B1E1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Комментарии ({comments.length})
      </h3>

      {user && (
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите комментарий..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] resize-none"
            disabled={isSubmitting}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#6B1616] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      )}

      <div className="max-h-[550px] overflow-y-auto pr-2 space-y-4 scrollbar-hide">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Пока нет комментариев. Будьте первым!
          </p>
        ) : (
          comments.map(comment => (
            <div
              key={comment.id}
              className={`p-4 rounded-xl border ${
                comment.authorId === user?.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {editingCommentId === comment.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] resize-none mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="px-3 py-1 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#6B1616] transition-colors text-sm"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#8B1E1E] text-white flex items-center justify-center text-sm font-bold">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {comment.authorName}
                        </p>
                        {comment.authorId === user?.id && (
                          <span className="text-xs text-gray-500">Вы</span>
                        )}
                      </div>
                    </div>
                    {comment.authorId === user?.id && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditing(comment)}
                          className="p-1 text-gray-500 hover:text-[#8B1E1E] transition-colors"
                          title="Редактировать"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          title="Удалить"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};