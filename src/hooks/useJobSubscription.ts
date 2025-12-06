import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Job } from '@/types/job'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook to subscribe to job updates via Supabase Broadcasts
 */
export function useJobSubscription(jobs: Job[]) {
    const queryClient = useQueryClient()

    useEffect(() => {
        // Filter for jobs that are processing
        const processingJobs = jobs.filter(j => j.status === 'processing')

        if (processingJobs.length === 0) return

        const channelsList: RealtimeChannel[] = []

        // Subscribe to updates for each processing job
        processingJobs.forEach((job, index) => {
            channelsList[index] = supabase.channel(`topic:job:${job.id}`, {
                config: {
                    private: true,
                    broadcast: {
                        replay: {
                            since: new Date(job.created_at).getTime(),
                            limit: 1
                        }
                    }
                }
            })

            channelsList[index].on(
                'broadcast',
                { event: 'UPDATE' },
                (payload) => {
                    if (payload?.meta?.replayed) {
                        console.log('Replayed message: ', payload)
                    } else {
                        console.log('This is a new message', payload)
                    }

                    // Invalidate specific job query and the main jobs list
                    queryClient.invalidateQueries({ queryKey: ['job', job.id] })
                    queryClient.invalidateQueries({ queryKey: ['jobs'] })
                }
            )
        })

        channelsList.forEach(channel => {
            channel.subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Subscribed to job updates')
                }
            })
        })

        return () => {
            console.log('Unsubscribing from job updates')
            channelsList.forEach(channel => {
                supabase.removeChannel(channel)
            })
        }
    }, [jobs, queryClient])
}
