import {createApi} from '@reduxjs/toolkit/query/react';
import {flushBuffer, normalizeData, throttle} from "../lib/utils";
import {WSMessage} from "../definitiions/types/WSMessage";

export let wsInstance: WebSocket | null = null;

export const websocketsApiSlice = createApi({
  reducerPath: 'websocketsApiSlice',
  baseQuery: async () => ({ data: [] }),
  tagTypes: ['WSData'],
  endpoints: (builder) => ({
    getLiveUpdates: builder.query<WSMessage[], void>({
      query: () => '',
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        const ws = new WebSocket('wss://rutube.space/ws');
        wsInstance = ws;
        let pendingMessages: WSMessage[] = [];
        const throttledFlush = throttle(flushBuffer, 200);

        try {
          await cacheDataLoaded;

          const listener = (event: MessageEvent) => {
            setTimeout(() => {
              try {
                const rawData = JSON.parse(event.data);
                const normalized = normalizeData(rawData);
                if (normalized) {
                  pendingMessages.push(normalized);
                  throttledFlush();
                }
              } catch (err) {
                console.error('Error parsing websocket message:', err);
              }
            }, 0);
          };

          ws.addEventListener('message', listener);
        } catch (error) {
          console.error('WebSocket error:', error);
        }

        await cacheEntryRemoved;
        ws.close();
        wsInstance = null;
      },
      providesTags: ['WSData'],
    }),
  }),
});

export const { useGetLiveUpdatesQuery } = websocketsApiSlice;