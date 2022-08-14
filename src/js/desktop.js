((PLUGIN_ID) => {
  'use strict';

	kintone.events.on(['app.record.detail.show',
						'app.record.index.show',
						'mobile.app.record.detail.show',
						'mobile.app.record.index.show'], (event) => {

		const anchors = document.querySelectorAll('a[href^="mailto:"]');
		if (!anchors) return;

		const config = kintone.plugin.app.getConfig(PLUGIN_ID);
		if (!config.templateAppId
		|| !config.templateNameFieldCode
		|| !config.emailFieldCode
		|| !['cc', 'bcc', 'subject', 'body'].find(c => config[c + 'FieldCode'])) {
			return event;	// not configure yet
		}

		const params = {
			app		: config.templateAppId,
			query	: `order by ${config.templateNameFieldCode} asc`
		};
		return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params)
		.then(({records}) => {
			if (!records.length) return;	// no records in Email template app

			const emailToRecord = new Map();
			(event.records || [event.record]).forEach(r => {
				emailToRecord.set(r[config.emailFieldCode].value, r);
			});
			anchors.forEach(a => {
				const r = emailToRecord.get(a.textContent?.trim() || '');
				if (!r) return;

				const getTemplates = tplRecords => {
					const templates = [];
					tplRecords.forEach(t => {
						const el = [];
						if (t[config.ccFieldCode]?.value) el.push(`cc=${t[config.ccFieldCode].value}`);
						if (t[config.bccFieldCode]?.value) el.push(`bcc=${t[config.bccFieldCode].value}`);
						if (t[config.subjectFieldCode]?.value) el.push(`subject=${encodeURIComponent(t[config.subjectFieldCode].value)}`);
						if (t[config.bodyFieldCode]?.value) {
							let body = t[config.bodyFieldCode].value;
							Object.entries(r).forEach(([fieldCode, value]) => {
								let v = value.value;
								if (Array.isArray(v)) v = v[0];
								if (v instanceof(Object)) v = v.name || v.value;
								body = body.replace(new RegExp(`{{\\s*${fieldCode}\\s*}}`, 'g'), v);
							});
							body = body.replace(/[^\r]\n/g, "\r\n");
							el.push(`body=${encodeURIComponent(body)}`);
						}
						templates.push({name: t[config.templateNameFieldCode].value, params: el});
					});
					return templates;	
				};

				const makeDialog = (id, html) => {
					document.getElementById(id)?.remove();
					const tpl = document.createElement('template');
					tpl.innerHTML = /* html */`
						<dialog
							id="${id}"
							style="border: solid 1px silver;"
						>
							<span
								class="material-symbols-outlined"
								style="display: inline-flex; vertical-align: middle; line-height: 2em"
							>
								drafts
							</span>
							<a
								onclick="document.getElementById('${id}').close()"
								style="float: right; color: gray; font-size: 2em"
							>
								×
							</a>
							<br />
							<br />
							${html}
						</dialog>
					`;
					document.body.appendChild(tpl.content);
					document.querySelector(`#${id}`).showModal();
					tpl.remove();	
				};

				a.onclick = (aEvent) => {
					aEvent.preventDefault();

					const html = /* html */`
					<ul style="padding-inline-start: 1em">
						${getTemplates(records).map((t) => /* html */`
							<li style="margin: 0.5em 0">
								<a href="${a.href}?${t.params.join('&')}" target="_blank">
									${t.name}
								</a>
							</li>`
						).join('')}
					</ul>`;
					makeDialog('email-template-dialog', html);
				};
			});
		})
		//.catch(console.error);
	});

})(kintone.$PLUGIN_ID);
