{{- /* One Application source: a chart from a Helm repository, or a path in this repository with its values. */ -}}
{{- define "argocd-applications.source" -}}
{{- $root := .root }}
{{- with .app }}
{{- if .chart }}
repoURL: {{ .chart.repoURL }}
chart: {{ .chart.name }}
targetRevision: {{ .chart.version | quote }}
{{- else }}
repoURL: {{ $root.Values.repoURL }}
targetRevision: {{ $root.Values.targetRevision }}
path: {{ .path }}
{{- end }}
{{- if or .valueFiles .helmParameters .helmValues }}
helm:
  {{- with .valueFiles }}
  valueFiles:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  {{- with .helmParameters }}
  parameters:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  {{- with .helmValues }}
  valuesObject:
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end }}
{{- end }}
{{- end }}
