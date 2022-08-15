((PLUGIN_ID) => {
	'use strict';

	const makeDialog = (id, html) => {
		document.getElementById(id)?.remove();
		const tpl = document.createElement('template');
		tpl.innerHTML = /* html */`
			<dialog
				id="${id}"
				style="border: solid 1px silver"
			>
				<span
					class="material-symbols-outlined"
					style="${[
						'display: inline-flex',
						'vertical-align: middle',
						'line-height: 2em'
					].join(';')}"
				>
					drafts
				</span>
				<a
					onclick="document.getElementById('${id}').close()"
					style="${[
						'float: right',
						'color: gray',
						'font-size: 2em'
					].join(';')}"
				>
					×
				</a>
				<br />
				${html}
			</dialog>
		`;
		document.body.appendChild(tpl.content);
		document.querySelector(`#${id}`).showModal();
		tpl.remove();	
	};
	const replacePlaceholder = (str, thisAppRecord) => {
		let ret = str;
		Object.entries(thisAppRecord).forEach(([fieldCode, value]) => {
			let v = value.value;
			if (Array.isArray(v)) v = v[0];
			if (v instanceof(Object)) v = v.name || v.value;
			ret = ret.replace(new RegExp(`{{\\s*${fieldCode}\\s*}}`, 'g'), v);
		});
		return ret.replace(/\n/g, "\r\n").replace(/\r+\n/g, "\r\n");
	};
	const getTemplates = (tplRecords, thisAppRecord, config) => {
		const templates = [];
		tplRecords.forEach(t => {
			const el = [];
			if (t[config.ccFieldCode]?.value) el.push(`cc=${t[config.ccFieldCode].value}`);
			if (t[config.bccFieldCode]?.value) el.push(`bcc=${t[config.bccFieldCode].value}`);
			if (t[config.subjectFieldCode]?.value) {
				el.push(`subject=${encodeURIComponent(
					replacePlaceholder(t[config.subjectFieldCode].value, thisAppRecord)
				)}`);
			}
			if (t[config.bodyFieldCode]?.value) {
				el.push(`body=${encodeURIComponent(
					replacePlaceholder(t[config.bodyFieldCode].value, thisAppRecord)
				)}`);
			}
			templates.push({
				name: t[config.templateNameFieldCode].value,
				params: el
			});
		});
		return templates;	
	};

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
			if (!records.length) return event;	// no records in Email template app

			const emailToRecord = new Map();
			(event.records || [event.record]).forEach(r => {
				emailToRecord.set(r[config.emailFieldCode].value, r);
			});

			anchors.forEach(a => {
				const thisAppRecord = emailToRecord.get(a.textContent?.trim() || '');
				if (!thisAppRecord) return;

				a.onclick = (aEvent) => {
					aEvent.preventDefault();

					const dialogId = 'email-template-dialog';
					const html = /* html */`
					<ul style="padding-inline-start: 1em">
						${getTemplates(records, thisAppRecord, config).map(t => /* html */`
							<li style="margin: 0.5em 0">
								<a
									href="${a.href}?${t.params.join('&')}"
									target="_blank"
									onclick="document.getElementById('${dialogId}').close()"
								>
									${t.name}
								</a>
							</li>`
						).join('')}
					</ul>`;
					makeDialog(dialogId, html);
				};
			});
			return event;
		})
		.catch((err) => {
			console.error(err);
			//event.error = err.message;	doesn't work.
			//return event;
			alert(err.message);
		});
	});

})(kintone.$PLUGIN_ID);
