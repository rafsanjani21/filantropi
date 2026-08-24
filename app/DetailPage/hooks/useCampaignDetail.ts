import { useState, useEffect, useCallback } from "react";
import { AuthService } from "@/lib/auth.service";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";

export function useCampaignDetail(slug: string | null) {
  const { t } = useTranslation();
  const { user, role, isInitialized } = useAuthStore();
  
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [totalCollected, setTotalCollected] = useState<number | null>(null);
  const [milestone, setMilestone] = useState<any>(null);

  const fetchMilestoneStatus = useCallback(async (campaignId: string) => {
    try {
      const res = await apiFetch(`/campaigns/milestone-status/${campaignId}`, { method: "GET" });
      if (res?.data) setMilestone(res.data);
    } catch (err) {
      console.error("Gagal menarik status milestone:", err);
    }
  }, []);

  useEffect(() => {
    if (!slug) {
      setError(t("campaign_id_not_found", "ID Kampanye tidak ditemukan"));
      setLoading(false);
      return;
    }

    const fetchCampaign = async () => {
      try {
        const res = await AuthService.getCampaignDetail(slug);
        const data = res.data || res;
        setCampaign(data);
        if (data?.id) fetchMilestoneStatus(data.id);
      } catch (err: any) {
        setError(err.message || t("fail_fetch_data", "Gagal memuat data"));
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [slug, fetchMilestoneStatus, t]);

  const receiverWallet = campaign?.wallet_address || campaign?.user?.wallet_address || "";
  
  useEffect(() => {
    if (!receiverWallet) return;
    const fetchHistory = async () => {
      try {
        const res = await apiFetch(`/donations/in/${receiverWallet}`, { method: "GET" });
        const apiData = res?.data || res;
        if (apiData) {
          let apiHistory: any[] = [];
          if (Array.isArray(apiData.history)) {
            apiHistory = apiData.history.map((tx: any, index: number) => ({
              tx_hash: tx.tx_hash || index.toString(),
              date: tx.created_at,
              type: "In",
              amount: String(tx.amount_idr ?? 0),
              from_to: tx.donatur_name || "Anonim",
            }));
          }
          setWalletHistory(apiHistory);
          if (apiData.total_balance_idr) setTotalCollected(parseFloat(apiData.total_balance_idr));
        }
      } catch (err) {
        console.error("Gagal memuat riwayat donasi:", err);
      }
    };
    fetchHistory();
  }, [receiverWallet]);

  return {
    campaign,
    loading,
    error,
    walletHistory,
    totalCollected,
    milestone,
    receiverWallet,
    user,
    role,
    isInitialized,
    fetchMilestoneStatus
  };
}