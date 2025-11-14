import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class BozonxTranslateGateway implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Translate Gateway',
		name: 'bozonxTranslateGateway',
		icon: 'file:translate-gateway.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["provider"] || "default"}} provider',
		description: 'Translate text using Translate Gateway microservice',
		defaults: {
			name: 'Translate Gateway',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'bozonxMicroservicesApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				description: 'Source text to translate (plain text or HTML)',
				placeholder: 'Hello, world!',
			},
			{
				displayName: 'Target Language',
				name: 'targetLang',
				type: 'string',
				default: 'en',
				required: true,
				description: 'Target language code (ISO 639-1), e.g., en, ru, es, fr, de',
				placeholder: 'en',
			},
			{
				displayName: 'Source Language',
				name: 'sourceLang',
				type: 'string',
				default: '',
				description: 'Source language code (ISO 639-1). If omitted, the provider may auto-detect it.',
				placeholder: 'ru',
			},
			{
				displayName: 'Provider',
				name: 'provider',
				type: 'options',
				options: [
					{
						name: 'Default',
						value: '',
						description: 'Use the default provider configured in the microservice',
					},
					{
						name: 'Google',
						value: 'google',
						description: 'Google Cloud Translation API',
					},
					{
						name: 'DeepL',
						value: 'deepl',
						description: 'DeepL Translation API',
					},
					{
						name: 'DeepSeek',
						value: 'deepseek',
						description: 'DeepSeek LLM (OpenAI-compatible)',
					},
					{
						name: 'OpenRouter',
						value: 'openrouter',
						description: 'OpenRouter LLM (OpenAI-compatible)',
					},
				],
				default: '',
				description: 'Translation provider to use',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						provider: ['deepseek', 'openrouter'],
					},
				},
				description: 'Model name for LLM providers. If omitted, provider-specific default will be used.',
				placeholder: 'deepseek-chat',
			},
			{
				displayName: 'Max Length',
				name: 'maxLength',
				type: 'number',
				default: 0,
				description: 'Per-request max input length (characters). 0 means use service default. Effective limit: min(service_limit, maxLength).',
				typeOptions: {
					minValue: 0,
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const text = this.getNodeParameter('text', i) as string;
				const targetLang = this.getNodeParameter('targetLang', i) as string;
				const sourceLang = this.getNodeParameter('sourceLang', i) as string;
				const provider = this.getNodeParameter('provider', i) as string;
				const model = this.getNodeParameter('model', i) as string;
				const maxLength = this.getNodeParameter('maxLength', i) as number;

				// Build request body
				const body: Record<string, unknown> = {
					text,
					targetLang,
				};

				if (sourceLang) {
					body.sourceLang = sourceLang;
				}

				if (provider) {
					body.provider = provider;
				}

				if (model) {
					body.model = model;
				}

				if (maxLength > 0) {
					body.maxLength = maxLength;
				}

				// Make API request
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bozonxMicroservicesApi',
					{
						method: 'POST',
						url: '/api/v1/translate',
						body,
						json: true,
					},
				);

				returnData.push({
					json: response as Record<string, unknown>,
					pairedItem: i,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: i,
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
