import { SHOPS_INDEX } from '~/common/constants/index.constants'

export const SHOPS_INDEX_CONFIG = {
  index: SHOPS_INDEX,
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
    analysis: {
      analyzer: {
        vietnamese_analyzer: {
          type: 'standard',
          stopwords: '_vietnamese_',
        },
      },
    },
    'index.store.preload': ['nvd'],
  },
  mappings: {
    properties: {
      id: {
        type: 'keyword',
      },
      name: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
      },
      description: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
      },
      logo: {
        type: 'keyword',
        index: false,
      },
    },
  },
}
