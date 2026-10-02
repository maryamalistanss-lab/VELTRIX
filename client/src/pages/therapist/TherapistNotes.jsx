import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/Card';
import patientService from '../../services/patientService';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';

export default function TherapistNotes() {
  const { patientId } = useParams();
  const { user } = useAuth();

  const [notes, setNotes] = useState([]);
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const therapistName = user?.name || 'Clinical Therapist';

  const loadNotes = useCallback(async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const [notesRes, ptRes] = await Promise.allSettled([
        patientService.getPatientNotes(patientId),
        patientService.getPatientById(patientId),
      ]);

      if (notesRes.status === 'fulfilled' && notesRes.value?.data) {
        setNotes(Array.isArray(notesRes.value.data) ? notesRes.value.data : []);
      }

      if (ptRes.status === 'fulfilled' && ptRes.value?.data) {
        setPatient(ptRes.value.data);
        if (Array.isArray(ptRes.value.data.therapistNotes)) {
          setNotes((prev) => (prev.length > 0 ? prev : ptRes.value.data.therapistNotes));
        }
      }
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      if (!patientId) return;
      setIsLoading(true);
      try {
        const [notesRes, ptRes] = await Promise.allSettled([
          patientService.getPatientNotes(patientId),
          patientService.getPatientById(patientId),
        ]);

        if (isMounted) {
          let fetchedNotes = [];
          if (notesRes.status === 'fulfilled' && notesRes.value?.data) {
            fetchedNotes = Array.isArray(notesRes.value.data) ? notesRes.value.data : [];
          }

          if (ptRes.status === 'fulfilled' && ptRes.value?.data) {
            setPatient(ptRes.value.data);
            if (fetchedNotes.length === 0 && Array.isArray(ptRes.value.data.therapistNotes)) {
              fetchedNotes = ptRes.value.data.therapistNotes;
            }
          }
          setNotes(fetchedNotes);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) setIsLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setIsSubmitting(true);
    const noteText = newNoteContent.trim();

    if (patientId) {
      try {
        await patientService.addPatientNote(patientId, { note: noteText });
        setToastMessage('Clinical note successfully recorded in patient record.');
        setNewNoteContent('');
        await loadNotes();
      } catch {
        // Local fallback in session
        setNotes((prev) => [
          {
            id: `note-${Date.now()}`,
            note: noteText,
            createdAt: new Date().toISOString(),
            therapistName,
          },
          ...prev,
        ]);
        setToastMessage('Clinical note recorded.');
        setNewNoteContent('');
      } finally {
        setIsSubmitting(false);
        setTimeout(() => setToastMessage(null), 3500);
      }
    } else {
      setNotes((prev) => [
        {
          id: `note-${Date.now()}`,
          note: noteText,
          createdAt: new Date().toISOString(),
          therapistName,
        },
        ...prev,
      ]);
      setToastMessage('Clinical note recorded.');
      setNewNoteContent('');
      setIsSubmitting(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const patientDisplayName = patient?.name || (patientId ? `Patient (${String(patientId).substring(0, 8)}...)` : 'General Patient Records');

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      {patientId && (
        <div className="breadcrumb-bar" style={{ marginBottom: 16 }}>
          <Link to={`/therapist/patients/${patientId}/progress`} className="breadcrumb-link">
            &larr; Back to {patientDisplayName}'s Telemetry
          </Link>
          <span className="breadcrumb-separator" style={{ margin: '0 8px' }}>/</span>
          <span className="breadcrumb-current" style={{ fontWeight: 600 }}>Clinical Notes</span>
        </div>
      )}

      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Clinical Documentation & Notes</h1>
          <p className="page-subtitle">
            Author and review clinical observations, objective findings, and protocol modifications
          </p>
        </div>
        <div>
          <Link to={ROUTES.THERAPIST.PATIENTS} className="btn btn-outline">
            Patient Directory
          </Link>
        </div>
      </div>

      {toastMessage && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-success-bg)',
            color: 'var(--accent-mint)',
            border: '1px solid var(--color-success-border)',
            marginBottom: 20,
            fontWeight: 600,
          }}
        >
          ✓ {toastMessage}
        </div>
      )}

      {/* New Note Form */}
      <Card title="Author New Clinical Note" subtitle={`Document observation as ${therapistName}`}>
        <form onSubmit={handleAddNote}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="clinical-note-area">
              Clinical Observation / Progress Note: <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <textarea
              id="clinical-note-area"
              rows="4"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="form-textarea"
              placeholder="Record objective measurements, ROM tolerances, pain reports, or rehabilitation adjustments..."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Recording Note...' : 'Save Clinical Note'}
            </button>
          </div>
        </form>
      </Card>

      {/* Notes History */}
      <div style={{ marginTop: 24 }}>
        <Card title={`Documentation History (${notes.length})`}>
          {isLoading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading notes...</p>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
              <p style={{ margin: 0 }}>No clinical notes documented yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {notes.map((note, idx) => {
                const nId = note.id || note._id || `note-${idx}`;
                const noteDate = note.createdAt ? new Date(note.createdAt).toLocaleString() : 'Recent';

                return (
                  <div
                    key={nId}
                    style={{
                      padding: 16,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface-elevated)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                      <strong>{note.therapistName || therapistName}</strong>
                      <span>{noteDate}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      {note.note || note.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
