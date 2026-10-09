import { apiService } from '@/lib/api'

export interface MemberContact {
  id?: number
  jenis_kontak: 'email' | 'no_telp' | 'whatsapp'
  kontak: string
}

export interface MemberIdentity {
  id?: number
  jenis_id: 'ktp' | 'sim' | 'passport' | 'kartu_mahasiswa' | 'kartu_pegawai' | 'lainnya'
  nomor_id: string
  file_scan?: string | null
}

export interface MemberDetail {
  id: number
  kode: string
  nama: string
  foto: string | null
  alamat: string
  latitude: number | null
  longitude: number | null
  telepon: string | null
  email: string | null
  tanggal_bergabung: string
  status: 'aktif' | 'nonaktif'
  kontak: MemberContact[]
  kartu_identitas: MemberIdentity[]
  created_at: string
  updated_at: string
}

export interface MemberListParams {
  page?: number
  rows?: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  globalFilter?: string
  filters?: { status?: string | null }
}

export interface MemberListResponse {
  data: MemberDetail[]
  total: number
  page: number
  limit: number
}

export interface MemberFormPayload {
  nama: string
  alamat: string
  latitude?: number | null
  longitude?: number | null
  foto?: File | null
  tanggal_bergabung?: string
  status?: 'aktif' | 'nonaktif'
  kontak: { jenis_kontak: string; kontak: string }[]
  kartu_identitas: { jenis_id: string; nomor_id: string; file_scan?: File | null }[]
}

function buildFormData(payload: MemberFormPayload): FormData {
  const formData = new FormData()
  formData.append('nama', payload.nama)
  formData.append('alamat', payload.alamat)
  if (payload.latitude != null) formData.append('latitude', String(payload.latitude))
  if (payload.longitude != null) formData.append('longitude', String(payload.longitude))
  if (payload.tanggal_bergabung) formData.append('tanggal_bergabung', payload.tanggal_bergabung)
  if (payload.status) formData.append('status', payload.status)
  if (payload.foto) formData.append('foto', payload.foto)

  formData.append(
    'kontak',
    JSON.stringify(payload.kontak.map(({ jenis_kontak, kontak }) => ({ jenis_kontak, kontak })))
  )
  formData.append(
    'kartu_identitas',
    JSON.stringify(payload.kartu_identitas.map(({ jenis_id, nomor_id }) => ({ jenis_id, nomor_id })))
  )

  payload.kartu_identitas.forEach((idCard, index) => {
    if (idCard.file_scan) {
      formData.append(`kartu_identitas_files[${index}]`, idCard.file_scan)
    }
  })

  return formData
}

export const memberService = {
  async list(params: MemberListParams): Promise<MemberListResponse> {
    return apiService.get('/members', {
      page: params.page,
      rows: params.rows,
      sortField: params.sortField || undefined,
      sortOrder: params.sortOrder,
      globalFilter: params.globalFilter || undefined,
      status: params.filters?.status || undefined
    })
  },

  async get(id: number | string): Promise<MemberDetail> {
    const response = await apiService.get<{ data: MemberDetail }>(`/members/${id}`)
    return response.data
  },

  async create(payload: MemberFormPayload): Promise<MemberDetail> {
    const response = await apiService.post<{ data: MemberDetail }>('/members', buildFormData(payload))
    return response.data
  },

  async update(id: number | string, payload: MemberFormPayload): Promise<MemberDetail> {
    const formData = buildFormData(payload)
    formData.append('_method', 'PUT')
    const response = await apiService.post<{ data: MemberDetail }>(`/members/${id}`, formData)
    return response.data
  },

  async updateStatus(id: number | string, status: 'aktif' | 'nonaktif'): Promise<MemberDetail> {
    const response = await apiService.patch<{ data: MemberDetail }>(`/members/${id}/status`, { status })
    return response.data
  },

  async mapPoints(): Promise<{ id: number; kode: string; nama: string; latitude: number; longitude: number }[]> {
    const response = await apiService.get<{ data: any[] }>('/members/map-points')
    return response.data
  }
}
