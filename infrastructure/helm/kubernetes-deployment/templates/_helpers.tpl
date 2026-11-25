{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "kubernetes-deployment.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Selector labels, shared by the Deployment, its pods, and the Service
*/}}
{{- define "kubernetes-deployment.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "kubernetes-deployment.labels" -}}
helm.sh/chart: {{ include "kubernetes-deployment.chart" . }}
{{ include "kubernetes-deployment.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
