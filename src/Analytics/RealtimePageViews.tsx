/*
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface PageView {
    page_view_id: number;
    session_id: number;
    page_url: string;
    entry_time: string;
    exit_time?: string;
    time_spent?: number;
}

const RealTimePageViews: React.FC = () => {
    const [pageViews, setPageViews] = useState<PageView[]>([]);

    useEffect(() => {
        // Set up the real-time subscription
        interface RealtimePayload {
            new: PageView;
            old: PageView | null;
            eventType: 'INSERT' | 'UPDATE' | 'DELETE';
        }

        const channel = supabase
            .channel('page_views_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'page_views' }, (payload: RealtimePayload) => {
                console.log('Change received!', payload.new);
                setPageViews(prevViews => [...prevViews, payload.new]);
            })
            .subscribe();
            console.log(supabase);  // Check the output to ensure it includes Realtime capabilities

    // Fetch initial data
    const fetchInitialData = async () => {
        try {
            const { data, error } = await supabase.from('page_views').select('*');
            if (error) throw error;
            setPageViews(data);
        } catch (error) {
            console.error('Error fetching initial page views:', error);
        }
    };
    
    fetchInitialData();
    }, []);
    console.log(pageViews);  // Check the output to ensure it includes the initial data
    return (
        <div>
            <h2>Real-Time Page Views</h2>
            <ul>
                {pageViews.map(view => (
                    <li key={view.page_view_id}>
                        URL: {view.page_url}, Time Spent: {view.time_spent || 'N/A'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RealTimePageViews;
*/
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../lib/supabase';

interface PageView {
    page_view_id: number;
    session_id?: number;
    page_url: string;
    entry_time: string;
    exit_time?: string;
    time_spent?: number;
}

interface PageViewCardProps {
    color?: string;
}

const PageViewCard = styled.div<PageViewCardProps>`
  background-color: var(--neutral-bg);
  border-left: 5px solid ${props => props.color || 'var(--default-border)'};
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 8px;
`;

const RealTimePageViews: React.FC = () => {
    const [pageViews, setPageViews] = useState<PageView[]>([]);

    useEffect(() => {
        const channel = supabase
            .channel('page_views_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'page_views' }, (payload: { new: PageView }) => {
                console.log('Change received:', payload);
                setPageViews(currentViews => [...currentViews, payload.new]);
            })
            .subscribe();

        const fetchInitialData = async () => {
            try {
                const { data, error } = await supabase.from('page_views').select('*');
                if (error) throw error;
                setPageViews(data || []);
            } catch (error) {
                console.error('Error fetching initial page views:', error);
            }
        };

        fetchInitialData();

        return () => {
            channel.unsubscribe();
        };
    }, []);

    const getColor = (url: string) => {
        if (url.includes('analytics')) return 'var(--accent-500)';
        if (url.includes('dashboard')) return 'var(--primary-700)';
        if (url.includes('settings')) return 'var(--green-500)';
        return 'var(--blue-500)';
    };

    return (
        <div>
            <h2>Real-Time Page Views</h2>
            {pageViews.map(view => (
                <PageViewCard key={view.page_view_id} color={getColor(view.page_url)}>
                    <div><strong>URL:</strong> {view.page_url}</div>
                    <div><strong>Entry Time:</strong> {new Date(view.entry_time).toLocaleString()}</div>
                    <div><strong>Exit Time:</strong> {view.exit_time ? new Date(view.exit_time).toLocaleString() : 'Still active'}</div>
                    <div><strong>Time Spent:</strong> {view.time_spent ? `${view.time_spent} seconds` : 'Calculating...'}</div>
                </PageViewCard>
            ))}
        </div>
    );
};

export default RealTimePageViews;
