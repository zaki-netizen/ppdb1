"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

// Schools grouped by region
const SCHOOLS_BY_REGION: Record<string, { id: string; name: string }[]> = {
  'Jakarta': [
    { id: '1', name: 'SMA Negeri 1 Jakarta' },
    { id: '2', name: 'SMA Negeri 2 Jakarta' },
    { id: '3', name: 'SMA Negeri 3 Jakarta' },
  ],
  'Bandung': [
    { id: '4', name: 'SMA Negeri 1 Bandung' },
    { id: '5', name: 'SMA Negeri 2 Bandung' },
    { id: '6', name: 'SMA Negeri 3 Bandung' },
  ],
  'Surabaya': [
    { id: '7', name: 'SMA Negeri 1 Surabaya' },
    { id: '8', name: 'SMA Negeri 2 Surabaya' },
    { id: '9', name: 'SMA Negeri 3 Surabaya' },
  ],
  'Bekasi': [
    { id: '10', name: 'SMA Negeri 1 Bekasi' },
    { id: '11', name: 'SMA Negeri 2 Bekasi' },
  ],
  'Depok': [
    { id: '12', name: 'SMA Negeri 1 Depok' },
    { id: '13', name: 'SMA Negeri 2 Depok' },
  ],
  'Tangerang': [
    { id: '14', name: 'SMA Negeri 1 Tangerang' },
    { id: '15', name: 'SMA Negeri 2 Tangerang' },
  ],
  'Yogyakarta': [
    { id: '16', name: 'SMA Negeri 1 Yogyakarta' },
    { id: '17', name: 'SMA Negeri 2 Yogyakarta' },
  ],
  'Semarang': [
    { id: '18', name: 'SMA Negeri 1 Semarang' },
    { id: '19', name: 'SMA Negeri 2 Semarang' },
  ],
  'Malang': [
    { id: '20', name: 'SMA Negeri 1 Malang' },
    { id: '21', name: 'SMA Negeri 2 Malang' },
  ],
};

// Get pathway ID based on school index and pathway type
const getPathwayId = (schoolId: number, pathwayType: string): number => {
  const schoolIndex = Math.ceil(schoolId / 3);
  const basePathwayId = (schoolIndex - 1) * 3;
  if (pathwayType === 'prestasi') return basePathwayId + 1;
  if (pathwayType === 'zonasi') return basePathwayId + 2;
  return basePathwayId + 3;
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'personal' | 'alamat' | 'sekolah' | 'ortu' | 'akun' | 'verifikasi'>('personal');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formData, setFormData] = useState({
    // Personal
    nisn: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    nilaiRataRata: '',
    // Address
    address: '',
    city: '',
    province: '',
    zipcode: '',
    // School
    preferredSchool: '',
    pathway: '',
    // Parent
    parentName: '',
    parentPhone: '',
    // Account
    password: '',
    confirmPassword: '',
  });

  // Get schools for selected region
  const getSchoolsForCity = (): { id: string; name: string }[] => {
    const city = formData.city?.toLowerCase() || '';
    for (const [region, schools] of Object.entries(SCHOOLS_BY_REGION)) {
      if (city.includes(region.toLowerCase())) {
        return schools;
      }
    }
    return Object.values(SCHOOLS_BY_REGION).flat();
  };

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset school selection when city changes
      ...(name === 'city' ? { preferredSchool: '', pathway: '' } : {}),
    }));
  };

  const validateStep = (): boolean => {
    if (step === 'personal') {
      if (!formData.nisn || formData.nisn.length !== 16) {
        addToast('error', 'NISN harus 16 digit');
        return false;
      }
      if (!formData.fullName.trim()) {
        addToast('error', 'Nama lengkap harus diisi');
        return false;
      }
      if (!formData.dateOfBirth) {
        addToast('error', 'Tanggal lahir harus diisi');
        return false;
      }
      if (!formData.gender) {
        addToast('error', 'Jenis kelamin harus dipilih');
        return false;
      }
      if (!formData.email.includes('@')) {
        addToast('error', 'Email tidak valid');
        return false;
      }
      if (!formData.phone) {
        addToast('error', 'No. telepon harus diisi');
        return false;
      }
      const nilai = parseFloat(formData.nilaiRataRata);
      if (!formData.nilaiRataRata || isNaN(nilai) || nilai < 0 || nilai > 100) {
        addToast('error', 'Nilai rata-rata ijazah harus 0-100');
        return false;
      }
    } else if (step === 'alamat') {
      if (!formData.address.trim()) {
        addToast('error', 'Alamat lengkap harus diisi');
        return false;
      }
      if (!formData.city.trim()) {
        addToast('error', 'Kota harus diisi');
        return false;
      }
      if (!formData.province.trim()) {
        addToast('error', 'Provinsi harus diisi');
        return false;
      }
    } else if (step === 'sekolah') {
      if (!formData.preferredSchool) {
        addToast('error', 'Sekolah tujuan harus dipilih');
        return false;
      }
      if (!formData.pathway) {
        addToast('error', 'Jalur pendaftaran harus dipilih');
        return false;
      }
    } else if (step === 'ortu') {
      if (!formData.parentName.trim()) {
        addToast('error', 'Nama orang tua harus diisi');
        return false;
      }
      if (!formData.parentPhone) {
        addToast('error', 'No. HP orang tua harus diisi');
        return false;
      }
    } else if (step === 'akun') {
      if (formData.password.length < 8) {
        addToast('error', 'Password minimal 8 karakter');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        addToast('error', 'Password tidak cocok');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 'personal') setStep('alamat');
      else if (step === 'alamat') setStep('sekolah');
      else if (step === 'sekolah') setStep('ortu');
      else if (step === 'ortu') setStep('akun');
      else if (step === 'akun') setStep('verifikasi');
    }
  };

  const handleBack = () => {
    if (step === 'alamat') setStep('personal');
    else if (step === 'sekolah') setStep('alamat');
    else if (step === 'ortu') setStep('sekolah');
    else if (step === 'akun') setStep('ortu');
    else if (step === 'verifikasi') setStep('akun');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      const schoolId = parseInt(formData.preferredSchool);
      const pathwayId = getPathwayId(schoolId, formData.pathway);

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nisn: formData.nisn,
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          email: formData.email,
          phone: formData.phone,
          nilaiRataRata: formData.nilaiRataRata,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          zipcode: formData.zipcode,
          preferredSchool: formData.preferredSchool,
          pathway: pathwayId.toString(),
          parentName: formData.parentName,
          parentPhone: formData.parentPhone,
          password: formData.password,
          certificatePoints: 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        addToast('error', data.error || 'Gagal menyimpan data');
        setLoading(false);
        return;
      }

      addToast('success', 'Pendaftaran berhasil! Mengalihkan ke dashboard...');

      // Redirect to login after registration
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 1500);

    } catch (err) {
      console.error('Submit error:', err);
      addToast('error', 'Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  const progressMap = { personal: 17, alamat: 33, sekolah: 50, ortu: 67, akun: 83, verifikasi: 100 };
  const steps = ['personal', 'alamat', 'sekolah', 'ortu', 'akun', 'verifikasi'];
  const availableSchools = getSchoolsForCity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`px-6 py-3 rounded-lg text-white font-semibold shadow-lg ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {t.type === 'success' ? '✓' : '✗'} {t.message}
          </div>
        ))}
      </div>

      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block bg-blue-600 text-white rounded-lg p-3 mb-3">
            <span className="text-2xl font-bold">PP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pendaftaran PPDB 2026</h1>
          <p className="text-gray-600">Langkah {steps.indexOf(step) + 1} dari {steps.length}</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progressMap[step as keyof typeof progressMap]}%` }} />
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Personal */}
            {step === 'personal' && (
              <>
                <h2 className="font-bold text-lg">Data Pribadi</h2>
                <input type="text" name="nisn" placeholder="NISN (16 digit)" value={formData.nisn} onChange={handleInputChange} maxLength={16} required className="w-full px-4 py-2 border rounded-lg" />
                <input type="text" name="fullName" placeholder="Nama Lengkap (sesuai ijazah)" value={formData.fullName} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg" />
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg" />
                <select name="gender" value={formData.gender} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg">
                  <option value="">Jenis Kelamin</option>
                  <option value="M">Laki-laki</option>
                  <option value="F">Perempuan</option>
                </select>
                <input type="number" name="nilaiRataRata" placeholder="Nilai Rata-rata Ijazah (0-100)" min="0" max="100" step="0.01" value={formData.nilaiRataRata} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg" />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg" />
                <input type="tel" name="phone" placeholder="No. HP" value={formData.phone} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg" />
              </>
            )}

            {/* Step 2: Alamat */}
            {step === 'alamat' && (
              <>
                <h2 className="font-bold text-lg">Alamat Tempat Tinggal</h2>
                <textarea name="address" placeholder="Alamat lengkap (Jl, No Rumah, RT/RW, Kelurahan, Kecamatan)" rows={3} value={formData.address} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg" />
                <input type="text" name="city" placeholder="Kota/Kabupaten" value={formData.city} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg" />
                <input type="text" name="province" placeholder="Provinsi" value={formData.province} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg" />
                <input type="text" name="zipcode" placeholder="Kode Pos" value={formData.zipcode} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" />
              </>
            )}

            {/* Step 3: Sekolah */}
            {step === 'sekolah' && (
              <>
                <h2 className="font-bold text-lg">Pilihan Sekolah</h2>
                <select name="preferredSchool" value={formData.preferredSchool} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg">
                  <option value="">-- Pilih Sekolah --</option>
                  {availableSchools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="space-y-2">
                  {[
                    { value: 'prestasi', label: 'Jalur Prestasi (Nilai ≥ 80)' },
                    { value: 'zonasi', label: 'Jalur Zonasi' },
                    { value: 'afirmasi', label: 'Jalur Afirmasi' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                      <input type="radio" name="pathway" value={opt.value} checked={formData.pathway === opt.value} onChange={handleInputChange} />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* Step 4: Orang Tua */}
            {step === 'ortu' && (
              <>
                <h2 className="font-bold text-lg">Data Orang Tua/Wali</h2>
                <input type="text" name="parentName" placeholder="Nama Lengkap Orang Tua" value={formData.parentName} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg" />
                <input type="tel" name="parentPhone" placeholder="No. HP Orang Tua" value={formData.parentPhone} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg" />
              </>
            )}

            {/* Step 5: Akun */}
            {step === 'akun' && (
              <>
                <h2 className="font-bold text-lg">🔐 Buat Akun</h2>
                <p className="text-sm text-gray-600 mb-4">Buat password untuk login ke dashboard Anda</p>
                <input type="password" name="password" placeholder="Password (min 8 karakter)" value={formData.password} onChange={handleInputChange} required minLength={8} className="w-full px-4 py-2 border rounded-lg" />
                <input type="password" name="confirmPassword" placeholder="Konfirmasi Password" value={formData.confirmPassword} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg" />
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Penting:</strong> Jangan lupa password Anda! Anda akan memerlukan password ini untuk login dan melihat hasil pengumuman.
                  </p>
                </div>
              </>
            )}

            {/* Step 6: Verifikasi */}
            {step === 'verifikasi' && (
              <>
                <h2 className="font-bold text-lg">✅ Verifikasi Data</h2>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Data Pribadi:</strong></p>
                  <p>• NISN: {formData.nisn}</p>
                  <p>• Nama: {formData.fullName}</p>
                  <p>• Email: {formData.email}</p>
                  <p>• No. HP: {formData.phone}</p>
                  <p><strong>Alamat:</strong></p>
                  <p>• {formData.address}, {formData.city}, {formData.province}</p>
                  <p><strong>Sekolah:</strong></p>
                  <p>• {availableSchools.find(s => s.id === formData.preferredSchool)?.name}</p>
                  <p>• Jalur: {formData.pathway}</p>
                  <p><strong>Orang Tua:</strong></p>
                  <p>• {formData.parentName}</p>
                  <p><strong>Akun:</strong></p>
                  <p>• Password: ****{formData.password.slice(-4)}</p>
                </div>
                <label className="flex items-start gap-2">
                  <input type="checkbox" required />
                  <span className="text-sm">Saya menyatakan data di atas benar dan sesuai dengan dokumen asli.</span>
                </label>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {step !== 'personal' && (
                <button type="button" onClick={handleBack} className="flex-1 bg-gray-200 py-3 rounded-lg font-semibold">← Kembali</button>
              )}
              {step !== 'verifikasi' ? (
                <button type="button" onClick={handleNext} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold">Lanjut →</button>
              ) : (
                <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50">
                  {loading ? '⟳ Mengirim...' : '✓ Daftar Sekarang'}
                </button>
              )}
            </div>
          </form>
        </Card>

        <p className="text-center mt-4 text-sm text-gray-600">
          Sudah punya akun? <Link href="/login" className="text-blue-600 font-semibold">Masuk</Link>
        </p>
      </div>
    </div>
  );
}