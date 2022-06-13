import "./App.css";
import { ethers } from "ethers";
import FundMe from "./artifacts/contracts/FundMe.sol/FundMe.json";
import {
  Button,
  Container,
  Icon,
  VStack,
  Input,
  ButtonGroup,
  Text,
  Badge,
} from "@chakra-ui/react";
import {
  RiMoneyDollarBoxLine,
  RiFilePaperLine,
  RiWallet2Line,
} from "react-icons/ri";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ethProv = window.ethereum;
const fundMeAddress = "";

function App() {
  const [fundingValue, setFundingValue] = useState("");
  const [fundingHistory, setFundingHistory] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    (async () => {
      if (typeof ethProv !== "undefined") {
        const provider = new ethers.providers.Web3Provider(ethProv);
        const signer = provider.getSigner();
        const walletAddressValue = await signer.getAddress();
        setWalletAddress(walletAddressValue);
      } else {
        toast.error("😶 Install MetaMask Extension...", {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    })();
  }, []);

  const requestAccount = async () => {
    await ethProv.requestAccount({ method: "eth_requestAccounts" });
  };

  const fund = async () => {
    if (typeof ethProv !== "undefined") {
      if (fundingValue) {
        requestAccount();

        const provider = new ethers.providers.Web3Provider(ethProv);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(fundMeAddress, FundMe.abi, signer);
        const transaction = await contract.fund({
          value: ethers.utils.parseEther(fundingValue),
        });
        await transaction.wait();
        setFundingValue("");
      } else {
        toast.error("😶 Enter Funding Price Please...", {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };

  const withdraw = async () => {
    if (typeof ethProv !== "undefined") {
      requestAccount();

      const provider = new ethers.providers.Web3Provider(ethProv);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(fundMeAddress, FundMe.abi, signer);
      const transaction = await contract.withdraw();
      await transaction.wait();
    } else {
      toast.error("😶 Install MetaMask Extension...", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const getFundingHistory = async () => {
    if (typeof ethProv !== "undefined") {
      requestAccount();

      const provider = new ethers.providers.Web3Provider(ethProv);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(fundMeAddress, FundMe.abi, provider);

      try {
        const data = await contract.report(signer.getAddress());
        setFundingHistory(ethers.utils.formatEther(data));
      } catch (error) {
        console.log(error);
      }
    } else {
      toast.error("😶 Install MetaMask Extension...", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <>
      <ToastContainer />

      <Container>
        <VStack mt="28px">
          <Text fontSize="xs" color="gray.500">
            Wallet address:
            <Badge ml="4px" variant="outline" colorScheme="blue">
              {walletAddress}
            </Badge>
          </Text>

          <Input
            placeholder="Funding Value (ETH)..."
            onChange={(event) => setFundingValue(event.target.value)}
          />
          {fundingHistory && (
            <Text fontSize="xs" color="gray.500">
              Until now, you've funded:
              <Badge variant="outline" colorScheme="green" ml="4px">
                {fundingHistory}
              </Badge>
            </Text>
          )}
          <ButtonGroup gap="2px">
            <Button
              colorScheme="green"
              variant="ghost"
              onClick={fund}
              leftIcon={<Icon as={RiMoneyDollarBoxLine} />}
            >
              Fund
            </Button>
            <Button
              colorScheme="gray"
              variant="ghost"
              onClick={getFundingHistory}
              leftIcon={<Icon as={RiFilePaperLine} />}
            >
              Get Funding Value
            </Button>
            <Button
              colorScheme="red"
              variant="ghost"
              onClick={withdraw}
              leftIcon={<Icon as={RiWallet2Line} />}
            >
              Withdraw
            </Button>
          </ButtonGroup>
        </VStack>
      </Container>
    </>
  );
}

export default App;
