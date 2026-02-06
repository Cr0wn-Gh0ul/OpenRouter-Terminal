/**
 * File History - Undo/Rollback System
 * 
 * Tracks file changes and enables reverting edits.
 * 
 * @module tools/builtins/fileHistory
 */

export interface FileChange {
    id: string;
    filePath: string;
    timestamp: Date;
    operation: 'create' | 'edit' | 'delete';
    previousContent: string | null;
    newContent: string | null;
    description: string;
}

class FileHistoryManager {
    private history: FileChange[] = [];
    private maxHistory = 50;

    /**
     * Record a file change for potential undo
     */
    record(change: Omit<FileChange, 'id' | 'timestamp'>): string {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const entry: FileChange = {
            ...change,
            id,
            timestamp: new Date(),
        };

        this.history.push(entry);

        // Trim old history
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(-this.maxHistory);
        }

        return id;
    }

    /**
     * Get recent changes (most recent first)
     */
    getRecent(count: number = 10): FileChange[] {
        return [...this.history].reverse().slice(0, count);
    }

    /**
     * Get a specific change by ID
     */
    getById(id: string): FileChange | undefined {
        return this.history.find(c => c.id === id);
    }

    /**
     * Remove a change from history (after undo)
     */
    remove(id: string): boolean {
        const idx = this.history.findIndex(c => c.id === id);
        if (idx !== -1) {
            this.history.splice(idx, 1);
            return true;
        }
        return false;
    }

    /**
     * Get count of changes
     */
    count(): number {
        return this.history.length;
    }

    /**
     * Clear all history
     */
    clear(): void {
        this.history = [];
    }
}

// Singleton instance
export const fileHistory = new FileHistoryManager();
