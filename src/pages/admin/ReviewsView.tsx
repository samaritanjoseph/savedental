import { API_BASE } from '../../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ReviewsView({ token }: { token: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    }
  });

  const toggleApprovalMutation = useMutation({
    mutationFn: async ({ id, is_approved }: { id: number, is_approved: boolean }) => {
      await fetch(`${API_BASE}/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_approved })
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${API_BASE}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
  });

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>{t("admin.dashboard.reviews.title", { defaultValue: "Reviews & Testimonials" })}</h2>
      </div>
      <div style={{ padding: '20px' }}>
        {isLoading ? <p>{t("admin.dashboard.overview.loading", { defaultValue: "Loadingâ€¦" })}</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.dashboard.patients.name", { defaultValue: "Name" })}</th>
                <th>{t("admin.dashboard.reviews.rating", { defaultValue: "Rating" })}</th>
                <th>{t("admin.dashboard.reviews.comment", { defaultValue: "Comment" })}</th>
                <th>{t("admin.dashboard.overview.status", { defaultValue: "Status" })}</th>
                <th>{t("admin.dashboard.patients.actions", { defaultValue: "Actions" })}</th>
              </tr>
            </thead>
            <tbody>
              {reviews?.map((review: any) => (
                <tr key={review.id}>
                  <td><strong>{review.name}</strong></td>
                  <td>{review.rating} / 5</td>
                  <td style={{ maxWidth: '300px' }}>{review.comment}</td>
                  <td>
                    <span className={`status-badge ${review.is_approved ? 'status-confirmed' : 'status-pending'}`}>
                      {review.is_approved ? t("admin.dashboard.reviews.approved", { defaultValue: "Approved" }) : t("admin.dashboard.reviews.pending", { defaultValue: "Pending" })}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => toggleApprovalMutation.mutate({ id: review.id, is_approved: !review.is_approved })}
                        className={`action-btn ${review.is_approved ? 'cancel' : 'confirm'}`}
                      >
                        {review.is_approved ? <><XCircle size={14}/> {t("admin.dashboard.reviews.hide", { defaultValue: "Hide" })}</> : <><CheckCircle size={14}/> {t("admin.dashboard.reviews.approve", { defaultValue: "Approve" })}</>}
                      </button>
                      <button onClick={() => deleteMutation.mutate(review.id)} className="action-btn cancel" title={t("admin.dashboard.users.delete", { defaultValue: "Delete" })}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews?.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>{t("admin.dashboard.reviews.no_reviews", { defaultValue: "No reviews yet." })}</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
